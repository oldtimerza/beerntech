import React from 'react'
import Image from 'gatsby-image'

import { rhythm } from '../utils/typography'

const Avatar = props => {
  const { avatar, description } = props
  return (
    <Image
      fixed={avatar.childImageSharp.fixed}
      alt={description}
      title={description}
      style={{
        marginRight: rhythm(1 / 2),
        marginBottom: 0,
        minWidth: 50,
        borderRadius: `100%`,
      }}
      imgStyle={{
        borderRadius: `50%`,
      }}
    />
  )
}

export default Avatar
