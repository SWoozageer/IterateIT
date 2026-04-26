'use client'

import Script from 'next/script'

export default function IterateITWidget() {
  return (
    <Script
      src="https://iterate-it.vercel.app/widget.js"
      strategy="afterInteractive"
      onLoad={() => {
        const w = window as any
        if (w.IterateIT) {
          w.IterateIT.init({
            orgId:         'd256424b-bc3e-4fa8-b0a0-c8ccc34fa556',
            systemId:      'YOUR_PMS_SYSTEM_ID',
            apiKey:        'YOUR_PMS_API_KEY',
            defaultUserId: '44ae48da-f929-40a3-a35f-e04ad332b493',
            position:      'bottom-right'
          })
        }
      }}
    />
  )
}