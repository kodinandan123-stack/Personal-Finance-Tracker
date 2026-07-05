import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { isAuthenticated } from '../services/auth'

function PlaceholderScreen() {
    return null
}

const AuthStack = createNativeStackNavigator()
const MainTabs = createBottomTabNavigator()
const RootStack = createNativeStackNavigator()

function AuthNavigator() {
    return (
          <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={PlaceholderScreen} />
        <AuthStack.Screen name="Register" component={PlaceholderScreen} />
  </AuthStack.Navigator>
  )
}

function MainTabNavigator() {
    return (
          <MainTabs.Navigator>
            <MainTabs.Screen name="Dashboard" component={PlaceholderScreen} />
            <MainTabs.Screen name="Transactions" component={PlaceholderScreen} />
            <MainTabs.Screen name="Budgets" component={PlaceholderScreen} />
            <MainTabs.Screen name="Goals" component={PlaceholderScreen} />
            <MainTabs.Screen name="Reports" component={PlaceholderScreen} />
            <MainTabs.Screen name="Profile" component={PlaceholderScreen} />
      </MainTabs.Navigator>
    )
}

export default function AppNavigator() {
    const [checkingAuth, setCheckingAuth] = React.useState(true)
    const [loggedIn, setLoggedIn] = React.useState(false)

  React.useEffect(() => {
        isAuthenticated().then((result) => {
                setLoggedIn(result)
                setCheckingAuth(false)
        })
  }, [])

  if (checkingAuth) {
        return null
  }

  return (
        <NavigationContainer>
          <RootStack.Navigator screenOptions={{ headerShown: false }}>
{loggedIn ? (
            <RootStack.Screen name="Main" component={MainTabNavigator} />
          ) : (
                      <RootStack.Screen name="Auth" component={AuthNavigator} />
          )}
  </RootStack.Navigator>
  </NavigationContainer>
   )
}
