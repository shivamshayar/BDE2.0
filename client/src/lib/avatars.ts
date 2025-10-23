import avatar1 from '@assets/stock_images/diverse_people_avata_a8080110.jpg';
import avatar2 from '@assets/stock_images/diverse_people_avata_1fb5b3e0.jpg';
import avatar3 from '@assets/stock_images/diverse_people_avata_132c5067.jpg';
import avatar4 from '@assets/stock_images/diverse_people_avata_735d51df.jpg';
import avatar5 from '@assets/stock_images/diverse_people_avata_3665acb4.jpg';
import avatar6 from '@assets/stock_images/diverse_people_avata_3daf895f.jpg';
import avatar7 from '@assets/stock_images/diverse_people_avata_9e1b36f0.jpg';
import avatar8 from '@assets/stock_images/diverse_people_avata_2416504e.jpg';
import avatar9 from '@assets/stock_images/diverse_people_avata_08c76fc3.jpg';
import avatar10 from '@assets/stock_images/diverse_people_avata_66b02f6b.jpg';
import avatar11 from '@assets/stock_images/professional_busines_e64d0821.jpg';
import avatar12 from '@assets/stock_images/professional_busines_664ec85c.jpg';
import avatar13 from '@assets/stock_images/professional_busines_3735f2cc.jpg';
import avatar14 from '@assets/stock_images/professional_busines_e2f6e2c3.jpg';
import avatar15 from '@assets/stock_images/professional_busines_4f627c83.jpg';
import avatar16 from '@assets/stock_images/professional_busines_df9f4906.jpg';
import avatar17 from '@assets/stock_images/professional_busines_7157dfc1.jpg';
import avatar18 from '@assets/stock_images/professional_busines_313f44a8.jpg';
import avatar19 from '@assets/stock_images/professional_busines_63438018.jpg';
import avatar20 from '@assets/stock_images/professional_busines_8b447d35.jpg';

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
