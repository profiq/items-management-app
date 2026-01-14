import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { useAuth } from '@/lib/providers/auth/useAuth';
import { Link } from 'react-router';

export function NavigationMenuReference() {
  const { user } = useAuth();
  return (
    <>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link to='/'>Main page</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link to='/about'>About</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link to='/contact'>Contact</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link to='/login'>Login</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          {user && (
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to='/protected'>Protected Page</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          )}
        </NavigationMenuList>
      </NavigationMenu>
    </>
  );
}
