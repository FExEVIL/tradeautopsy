import { Metadata } from 'next'
import { ExtensionSettingsClient } from './ExtensionSettingsClient'

export const metadata: Metadata = {
  title: 'Browser Extension - Settings | TradeAutopsy',
  description: 'Manage your TradeAutopsy browser extension settings and API token',
}

export default function ExtensionSettingsPage() {
  return <ExtensionSettingsClient />
}

