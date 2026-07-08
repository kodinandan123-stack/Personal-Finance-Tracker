import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { isAuthenticated } from '../services/auth'
import LoginScreen from '../screens/LoginScreen'
import RegisterScreen from '../screens/RegisterScreen'
import DashboardScreen from '../screens/DashboardScreen'
import TransactionsScreen from '../screens/TransactionsScreen'
import BudgetsScreen from '../screens/BudgetsScreen'
import GoalsScreen from '../screens/GoalsScreen'

function PlaceholderScreen() {
    return null
}

const AuthStack = createNativeStackNavigator()
const MainTabs = createBottomTabNavigator()
const RootStack = createNativeStackNavigator()

function AuthNavigator({ onLoginSuccess }) {
    return (
          <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login">
{(props) => <LoginScreen {...props} onLoginSuccess={onLoginSuccess} />}
  </AuthStack.Screen>
      <AuthStack.Screen name="Register">
{(props) => <RegisterScreen {...props} onLoginSuccess={onLoginSuccess} />}
  </AuthStack.Screen>
  </AuthStack.Navigator>
  )
}

function MainTabNavigator({ onLogout }) {
    return (
          <MainTabs.Navigator>
            <MainTabs.Screen name="Dashboard">
    {(props) => <DashboardScreen {...props} onLogout={onLogout} />}
</MainTabs.Screen>
        <MainTabs.Screen name="Transactions" component={TransactionsScreen} />
            <MainTabs.Screen name="Budgets" component={BudgetsScreen} />
            <MainTabs.Screen name="Goals" component={GoalsScreen} />
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
            <RootStack.Screen name="Main">
{() => <MainTabNavigator onLogout={() => setLoggedIn(false)} />}
  </RootStack.Screen>
          ) : (
            <RootStack.Screen name="Auth">
{() => <AuthNavigator onLoginSuccess={() => setLoggedIn(true)} />}
</RootStack.Screen>
        )}
</RootStack.Navigator>
          </NavigationContainer>
  )
}
