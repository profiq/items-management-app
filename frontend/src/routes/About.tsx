//import './App.css'

import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import react_image from '@/assets/react.svg';

function About() {
  return (
    <>
      <h1>Reference website</h1>
      <div className=''>
        This is a reference website. It was created as an example for the future
        students on Student Pool
      </div>
      <div>
        {' '}
        This website is made using
        <Avatar>
          <AvatarImage src={react_image} alt='React' />
          <AvatarFallback> React</AvatarFallback>
        </Avatar>
      </div>
    </>
  );
}

export default About;
