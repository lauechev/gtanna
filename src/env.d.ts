/// <reference types="astro/client" />

declare module '*.JPG' {
  const metadata: import('astro').ImageMetadata
  export default metadata
}
