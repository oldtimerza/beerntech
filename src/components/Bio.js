import React from 'react'
import { StaticQuery, graphql } from 'gatsby'
import Image from 'gatsby-image'

import { rhythm } from '../utils/typography'
import Avatar from './Avatar'

const Bio = props => {
  const { author } = props
  const description = author.id + '. ' + author.bio
  return (
    <div
      style={{
        display: `flex`,
        marginBottom: rhythm(2.5),
      }}
    >
      <Avatar avatar={author.avatar} description={description} />
      <p>
        Written by <strong>{author.id}</strong>.{` `}
        {author.bio}
      </p>
    </div>
  )
}

export default Bio
