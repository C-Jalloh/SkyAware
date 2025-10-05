import React from 'react';

import { getInitials } from '@/utils/helpers';

type ProfileProps = {
  fullName?: string;
};

const Profile = (props: ProfileProps) => {
  return (
    <div className='w-8 h-8 md:w-12 md:h-12 bg-blue-600 flex justify-center items-center rounded-full text-gray-50 font-bold cursor-pointer select-none'>
      {getInitials(props.fullName ?? 'John Doe')}
    </div>
  );
};

export default Profile;
