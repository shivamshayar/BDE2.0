import bear from '@assets/stock_images/bear.png';
import catPng from '@assets/stock_images/cat.png';
import dogPng from '@assets/stock_images/dog.png';
import icebear from '@assets/stock_images/icebear.png';
import koala from '@assets/stock_images/koala.jpg';
import lobster from '@assets/stock_images/lobster.png';
import ninjaturtle1 from '@assets/stock_images/ninjaturtle1.png';
import ninjaturtle2 from '@assets/stock_images/ninjaturtle2.png';
import penguin from '@assets/stock_images/penguin.png';
import pig from '@assets/stock_images/pig.png';
import squirrel from '@assets/stock_images/squirrel.png';
import beaver from '@assets/stock_images/beaver.jpg';
import catJpg from '@assets/stock_images/cat.jpg';
import cheetah from '@assets/stock_images/cheetah.jpg';
import clownfish from '@assets/stock_images/clownfish.jpg';
import dogJpg from '@assets/stock_images/dog.jpg';
import dolphin from '@assets/stock_images/dolphin.jpg';
import eagle from '@assets/stock_images/eagle.jpg';
import elephant from '@assets/stock_images/elephant.jpg';
import fox from '@assets/stock_images/fox.jpg';
import goldfish from '@assets/stock_images/goldfish.jpg';
import lion from '@assets/stock_images/lion.jpg';
import owl from '@assets/stock_images/owl.jpg';
import sausageDog from '@assets/stock_images/sausage_dog.jpg';

export const AVATAR_IMAGES = [
  bear,
  catPng,
  dogPng,
  icebear,
  koala,
  lobster,
  ninjaturtle1,
  ninjaturtle2,
  penguin,
  pig,
  squirrel,
  beaver,
  catJpg,
  cheetah,
  clownfish,
  dogJpg,
  dolphin,
  eagle,
  elephant,
  fox,
  goldfish,
  lion,
  owl,
  sausageDog,
];

export const getAvatarUrl = (index: number): string => {
  if (index >= 0 && index < AVATAR_IMAGES.length) {
    return AVATAR_IMAGES[index];
  }
  return AVATAR_IMAGES[0];
};
