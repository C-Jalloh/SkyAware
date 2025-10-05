import * as React from 'react';
import type { SVGProps } from 'react';

const NotificationIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={props.width ?? 30}
    height={props.height ?? 30}
    fill='none'
    viewBox='0 0 96 96'
    {...props}
  >
    <path
      fill='#635BFF'
      stroke='#20477D'
      d='M48 .5c19.634 0 35.5 14.852 35.5 33.102v3.379c0 4.162 1.313 8.228 3.783 11.686l5.91 8.27c5.166 7.24 1.253 17.126-7.823 19.434-24.433 6.228-50.307 6.228-74.74 0C1.696 74.1-2.237 64.484 2.57 57.278l.237-.34 5.909-8.271v-.001c2.475-3.484 3.793-7.54 3.789-11.685V33.6C12.506 15.353 28.366.5 48 .5Z'
      opacity={0.5}
    />
    <path
      fill='#635BFF'
      stroke='#7F7AD8'
      d='M72.584 80.053c-1.78 4.375-4.97 8.19-9.186 10.946-4.472 2.923-9.863 4.501-15.401 4.501s-10.93-1.578-15.403-4.5c-4.215-2.756-7.407-6.572-9.186-10.947a153.05 153.05 0 0 0 49.176 0Z'
    />
  </svg>
);
export default NotificationIcon;
