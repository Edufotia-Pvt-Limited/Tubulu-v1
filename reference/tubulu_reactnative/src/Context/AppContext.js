import React, { createContext, useState } from "react"
import { Animated } from "react-native"

export const appContext = createContext({});

function AppContext(props) {

  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);

  return (
    <appContext.Provider
      value={{
        state: {
          isContextMenuOpen
        },
        actions: {
          setIsContextMenuOpen
        }
      }}
    >
      {props.children}
    </appContext.Provider>
  )
}

export default AppContext