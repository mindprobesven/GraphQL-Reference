import React, { Component } from 'react'
import { withApollo } from 'react-apollo'
import gql from 'graphql-tag'
import Link from './Link'

const FEED_SEARCH_QUERY = gql`
  query FeedSearchQuery($filter: String!) {
    feed(filter: $filter) {
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
    }
  }
`

class Search extends Component {
  state = {
    links: [],
    filter: '',
  }

  executeSearch = async () => {
    const { filter } = this.state
    const { client } = this.props

    const result = await client.query({
      query: FEED_SEARCH_QUERY,
      variables: { filter },
    })

    const { data: { feed: { links } } } = result
    this.setState({ links })
  }

  render() {
    const { links } = this.state

    return (
      <div>
        <div>
          Search
          <input
            type="text"
            onChange={e => this.setState({ filter: e.target.value })}
          />
          <button type="button" onClick={() => this.executeSearch()}>OK</button>
        </div>
        {links.map((link, index) => (
          <Link key={link.id} link={link} index={index} />
        ))}
      </div>
    )
  }
}

export default withApollo(Search)
