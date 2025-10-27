import avatar1 from '@assets/stock_images/bear.png';
import avatar2 from '@assets/stock_images/cat.png';
import avatar3 from '@assets/stock_images/dog.png';
import avatar4 from '@assets/stock_images/icebear.png';
import avatar5 from '@assets/stock_images/koala.jpg';
import avatar6 from '@assets/stock_images/lobster.png';
import avatar7 from '@assets/stock_images/ninjaturtle1.png';
import avatar8 from '@assets/stock_images/ninjaturtle2.png';
import avatar9 from '@assets/stock_images/penguin.png';
import avatar10 from '@assets/stock_images/pig.png';
import avatar11 from '@assets/stock_images/squirrel.png';
import avatar12 from '@assets/stock_images/bear.png';
import avatar13 from '@assets/stock_images/cat.png';
import avatar14 from '@assets/stock_images/dog.png';
import avatar15 from '@assets/stock_images/icebear.png';
import avatar16 from '@assets/stock_images/koala.jpg';
import avatar17 from '@assets/stock_images/lobster.png';
import avatar18 from '@assets/stock_images/ninjaturtle1.png';
import avatar19 from '@assets/stock_images/ninjaturtle2.png';
import avatar20 from '@assets/stock_images/penguin.png';
export const AVATAR_IMAGES = [
  avatar1,
  avatar2,
  avatar3,
  avatar4,
  avatar5,
  avatar6,
  avatar7,
  avatar8,
  avatar9,
  avatar10,
  avatar11,
  avatar12,
  avatar13,
  avatar14,
  avatar15,
  avatar16,
  avatar17,
  avatar18,
  avatar19,
  avatar20,
];

export const getAvatarUrl = (index: number): string => {
  if (index >= 0 && index < AVATAR_IMAGES.length) {
    return AVATAR_IMAGES[index];
  }
  return AVATAR_IMAGES[0];
};
