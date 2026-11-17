import { createContext, useContext } from 'react'

export interface NavbarActionContextValue {
  /** `true` when the action is rendered inside the mobile actions drawer. */
  inDrawer: boolean
  /** Closes the actions drawer. Does nothing when the action is not in the drawer. */
  closeDrawer: () => void
}

const outsideDrawer: NavbarActionContextValue = { inDrawer: false, closeDrawer: () => {} }

// Kept apart from `Navbar.tsx` so an app importing only the hook doesn't pull in the Navbar, its
// drawers and icons (issue #67). With code splitting both end up sharing a single context.
export const NavbarActionContext = createContext<NavbarActionContextValue>(outsideDrawer)

/** Where an element passed in `Navbar`'s `actions` is rendered, and a way to close the drawer. */
export function useNavbarAction(): NavbarActionContextValue {
  return useContext(NavbarActionContext)
}
