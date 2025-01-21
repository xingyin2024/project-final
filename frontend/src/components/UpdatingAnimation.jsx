import Lottie from 'lottie-react';
import Updating from '../assets/Updating.json';

export const UpdatingAnimation = () => {
  return (
    <Lottie
      animationData={Updating}
      loop={true}
      autoplay
      style={{
        width: 300,
        height: 300,
      }}
    />
  );
};
