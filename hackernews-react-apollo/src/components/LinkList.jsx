import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import { LINKS_PER_PAGE } from '../constants'
import Link from './Link'

const NEW_VOTES_SUBSCRIPTION = gql`
  subscription {
    newVote {
      node {
        id
        link {
          id
          url
          description
          postedBy {
            id
            name
          }
          votes {
            id
            user {
              id
            }
          }
        }
        user {
          id
        }
      }
    }
  }
`

const NEW_LINKS_SUBSCRIPTION = gql`
  subscription {
    newLink {
      node {
        id
        url
        description
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
    }
  }
`

export const FEED_QUERY = gql`
  query FeedQuery($first: Int, $skip: Int, $orderBy: LinkOrderByInput) {
    feed(first: $first, skip: $skip, orderBy: $orderBy) {
      links {
        id
        url
        description
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
      count
    }
  }
`

export default class LinkList extends Component {
  componentDidMount = () => {
    // console.log('Book Examples')
  }

  updateCacheAfterVote = (store, createVote, linkId) => {
    const { location, match } = this.props

    const isNewPage = location.pathname.includes('new')
    const page = parseInt(match.params.page, 10)

    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0
    const first = isNewPage ? LINKS_PER_PAGE : 100
    const orderBy = isNewPage ? 'createdAt_DESC' : null

    const data = store.readQuery(
      {
        query: FEED_QUERY,
        variables: { first, skip, orderBy },
      },
    )

    const votedLink = data.feed.links.find(link => link.id === linkId)
    votedLink.votes = createVote.link.votes

    store.writeQuery({ query: FEED_QUERY, data })
  }

  subscribeToNewLinks = (subscribeToMore) => {
    subscribeToMore({
      document: NEW_LINKS_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        const newLink = subscriptionData.data.newLink.node

        return Object.assign({}, prev, {
          feed: {
            links: [newLink, ...prev.feed.links],
            count: prev.feed.links.length + 1,
            __typename: prev.feed.__typename,
          },
        })
      },
    })
  }

  subscribeToNewVotes = (subscribeToMore) => {
    subscribeToMore({
      document: NEW_VOTES_SUBSCRIPTION,
    })
  }

  getQueryVariables = () => {
    const { location, match } = this.props

    const isNewPage = location.pathname.includes('new')
    const page = parseInt(match.params.page, 10)

    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0
    const first = isNewPage ? LINKS_PER_PAGE : 100
    const orderBy = isNewPage ? 'createdAt_DESC' : null
    return { first, skip, orderBy }
  }

  getLinksToRender = (data) => {
    const { location } = this.props

    const isNewPage = location.pathname.includes('new')
    if (isNewPage) {
      return data.feed.links
    }

    const rankedLinks = data.feed.links.slice()
    rankedLinks.sort((l1, l2) => l2.votes.length - l1.votes.length)
    return rankedLinks
  }

  nextPage = (data) => {
    const { history, match } = this.props

    const page = parseInt(match.params.page, 10)
    if (page <= data.feed.count / LINKS_PER_PAGE) {
      const nextPage = page + 1
      history.push(`/new/${nextPage}`)
    }
  }

  previousPage = () => {
    const { history, match } = this.props

    const page = parseInt(match.params.page, 10)
    if (page > 1) {
      const previousPage = page - 1
      history.push(`/new/${previousPage}`)
    }
  }

  render() {
    const { location, match } = this.props

    return (
      <Query query={FEED_QUERY} variables={this.getQueryVariables()}>
        {({
          loading,
          error,
          data,
          subscribeToMore,
        }) => {
          if (loading) return <div>Fetching</div>
          if (error) return <div>Error</div>

          this.subscribeToNewLinks(subscribeToMore)
          this.subscribeToNewVotes(subscribeToMore)

          const linksToRender = this.getLinksToRender(data)
          const isNewPage = location.pathname.includes('new')
          const pageIndex = match.params.page
            ? (match.params.page - 1) * LINKS_PER_PAGE
            : 0

          return (
            <Fragment>
              {linksToRender.map((link, index) => (
                <Link
                  key={link.id}
                  link={link}
                  index={index + pageIndex}
                  updateStoreAfterVote={this.updateCacheAfterVote}
                />
              ))}
              {isNewPage && (
                <div className="flex ml4 mv3 gray">
                  <div className="pointer mr2" onClick={this.previousPage}>
                    Previous
                  </div>
                  <div className="pointer" onClick={() => this.nextPage(data)}>
                    Next
                  </div>
                </div>
              )}
            </Fragment>
          )
        }}
      </Query>
    )
  }
}

LinkList.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
  match: PropTypes.shape({
    params: PropTypes.object.isRequired,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
}
