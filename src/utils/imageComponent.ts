import type { ElementType, ImgHTMLAttributes } from 'react'

/**
 * Element rendered in place of `<img>` by `Image` and `ImageGallery`, such as a wrapper around
 * Next.js `Image` (`(props) => <NextImage {...props} fill />`, in a 'use client' file). It only
 * receives standard `<img>` attributes: `priority` arrives as `loading="eager"` +
 * `fetchPriority="high"`.
 */
export type ImageComponent = ElementType<
  Pick<
    ImgHTMLAttributes<HTMLImageElement>,
    'className' | 'onError' | 'loading' | 'decoding' | 'fetchPriority' | 'sizes'
  > & {
    src: string
    alt: string
    // Numbers only (not the `string | number` of <img>), as `Image` passes them and as Next.js
    // `Image` requires.
    width?: number
    height?: number
  }
>
