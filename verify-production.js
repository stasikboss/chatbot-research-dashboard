#!/usr/bin/env node

/**
 * Production Verification Script
 * Checks if the Vercel deployment is working correctly
 */

const PRODUCTION_URL = 'https://chatbot-dashboard-iota-nine.vercel.app'

async function checkEndpoint(path, description) {
  try {
    const response = await fetch(`${PRODUCTION_URL}${path}`)
    const status = response.status
    const statusText = response.ok ? '✅ OK' : '❌ ERROR'
    console.log(`${statusText} [${status}] ${description}: ${path}`)
    return response.ok
  } catch (error) {
    console.log(`❌ ERROR ${description}: ${path}`)
    console.log(`   Error: ${error.message}`)
    return false
  }
}

async function checkAPI(path, description) {
  try {
    const response = await fetch(`${PRODUCTION_URL}${path}`)
    if (response.ok) {
      const data = await response.json()
      console.log(`✅ OK ${description}: ${path}`)
      return true
    } else {
      console.log(`❌ ERROR [${response.status}] ${description}: ${path}`)
      return false
    }
  } catch (error) {
    console.log(`❌ ERROR ${description}: ${path}`)
    console.log(`   Error: ${error.message}`)
    return false
  }
}

async function verify() {
  console.log('\n🔍 Verifying Production Deployment...\n')
  console.log(`Production URL: ${PRODUCTION_URL}\n`)

  const results = []

  // Check main pages
  console.log('📄 Checking Pages:')
  results.push(await checkEndpoint('/', 'Home/Consent Page'))
  results.push(await checkEndpoint('/register', 'Registration Page'))
  results.push(await checkEndpoint('/complete', 'Complete Page'))
  results.push(await checkEndpoint('/dashboard/login', 'Dashboard Login'))

  console.log('\n🔌 Checking API Endpoints:')
  results.push(await checkAPI('/api/conditions', 'Conditions API'))

  console.log('\n' + '='.repeat(50))
  const passed = results.filter(r => r).length
  const total = results.length

  if (passed === total) {
    console.log(`\n✅ All checks passed! (${passed}/${total})`)
    console.log('\n🎉 Production deployment is working correctly!')
    console.log('\nNext steps:')
    console.log('1. Visit: ' + PRODUCTION_URL)
    console.log('2. Complete a test registration')
    console.log('3. Verify chat flow works end-to-end')
  } else {
    console.log(`\n⚠️  Some checks failed (${passed}/${total} passed)`)
    console.log('\nTroubleshooting:')
    console.log('1. Check Vercel deployment status')
    console.log('2. Verify environment variables are set')
    console.log('3. Check Vercel function logs for errors')
    console.log('4. Ensure DATABASE_URL is accessible')
  }
  console.log('\n')
}

verify().catch(console.error)
