const skins = [
    { name: 'Daddy', image: new Image(), src: 'assets/images/mono/idle.png' }
];

skins.forEach(skin => {
    skin.image.src = skin.src;
});
  
export function getSkins() {
    return skins;
}