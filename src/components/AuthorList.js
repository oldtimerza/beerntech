import React from 'react'

import Avatar from './Avatar'

const AuthorList = props => {
  const { authors } = props
  return (
    <div>
      {authors.map(author => {
        const description = author.id + '. ' + author.bio
        return <Avatar avatar={author.avatar} description={description} />
      })}
    </div>
  )
}

export default AuthorList
