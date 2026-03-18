//import './App.css'

import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import react_image from '@/assets/react.svg';

function About() {
  return (
    <div data-testid='about-page'>
      <h1 data-testid='about-title'>Reference website</h1>
      <div className='' data-testid='about-description'>
        This is a reference website. It was created as an example for the future
        students on Student Pool
      </div>
      <div data-testid='about-tech-info'>
        {' '}
        This website is made using
        <Avatar>
          <AvatarImage
            src={react_image}
            alt='React'
            data-testid='about-react-logo'
          />
          <AvatarFallback> React</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}

export default About;
