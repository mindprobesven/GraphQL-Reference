import React, { Component } from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { Mutation } from 'react-apollo'
import AUTH_TOKEN from '../constants'

const VOTE_MUTATION = gql`
  mutation VoteMutation($linkId: ID!) {
    vote(linkId: $linkId) {
      id
      link {
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
`

export default class Link extends Component {
  componentDidMount = () => {
    // console.log('Book Examples')
  }

  render() {
    const { link, index, updateStoreAfterVote } = this.props
    const authToken = localStorage.getItem(AUTH_TOKEN)

    return (
      <div className="flex mt2 items-start">
        <div className="flex items-center">
          <span className="grey">
            { index + 1 }
            .
          </span>
          {authToken && (
            <Mutation
              mutation={VOTE_MUTATION}
              variables={{ linkId: link.id }}
              update={(store, { data: { vote } }) => updateStoreAfterVote(store, vote, link.id)
            }
            >
              {voteMutation => (
                <div className="ml1 gray f11" onClick={voteMutation}>
                  ▲
                </div>
              )}
            </Mutation>
          )}
        </div>
        <div className="ml1">
          <div>
            { link.description }
            <br />
            (
            { link.url }
            )
            <br />
            <br />
          </div>
          <div className="f6 lh-copy gray">
            {link.votes.length}
            {' '}
            votes | by
            {' '}
            {link.postedBy
              ? link.postedBy.name
              : 'Unknown'}
            {' '}
          </div>
        </div>
      </div>
    )
  }
}

Link.defaultProps = {
  link: {},
  updateStoreAfterVote: () => null,
}

Link.propTypes = {
  link: PropTypes.shape({
    description: PropTypes.string,
    url: PropTypes.string,
  }),
  index: PropTypes.number.isRequired,
  updateStoreAfterVote: PropTypes.func,
}
