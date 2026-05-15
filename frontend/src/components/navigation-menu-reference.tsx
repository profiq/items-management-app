import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { useAuth } from '@/lib/providers/auth/useAuth';
import { Link } from 'react-router';
import { HoverProtected } from './hover-protected';

export function NavigationMenuReference() {
  const { user, role } = useAuth();
  return (
    <>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link to='/'>Home</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link to='/login'>Login</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          {user && (
            <>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to='/profile'>
                    <div className='flex items-center gap-1'>
                      Profile Page
                      <HoverProtected />
                    </div>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to='/employees'>
                    <div className='flex items-center gap-1'>
                      List of Employees
                      <HoverProtected />
                    </div>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              {role === 'admin' && (
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link to='/admin'>
                      <div className='flex items-center gap-1'>
                        Admin
                        <HoverProtected />
                      </div>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}
            </>
          )}
        </NavigationMenuList>
      </NavigationMenu>
    </>
  );
}
