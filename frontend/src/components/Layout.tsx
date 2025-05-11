import React, { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faHome,
  faChartPie,
  faCube,
  faFolder,
  faDollarSign
} from '@fortawesome/free-solid-svg-icons'

interface LayoutProps {
  children: ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: typeof faHome | typeof faChartPie | typeof faCube | typeof faFolder | typeof faDollarSign;
}

const Layout = ({ children }: LayoutProps) => {
  const router = useRouter()

  const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/', icon: faHome },
    { name: 'Analytics', href: '/analytics', icon: faChartPie },
    { name: 'Products', href: '/products', icon: faCube },
    { name: 'Categories', href: '/categories', icon: faFolder },
    { name: 'Sales', href: '/sales', icon: faDollarSign },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-indigo-600 fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-white text-xl font-bold">SmartMart</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        <aside className="w-64 fixed h-full bg-white shadow-lg">
          <div className="h-full px-3 py-4 overflow-y-auto">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center p-2 text-base font-normal rounded-lg hover:bg-gray-100 ${
                      router.pathname === item.href 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : 'text-gray-900'
                    }`}
                  >
                    <FontAwesomeIcon 
                      icon={item.icon} 
                      className="w-5 h-5 mr-3" 
                    />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="ml-64 flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
