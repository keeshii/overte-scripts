

export function shuffle(arr: Array<any>) {
  let i, r, tmp;

  for (i = 0; i < arr.length; i++) {
    r = Math.floor(Math.random() * arr.length);
    tmp = arr[r];
    arr[r] = arr[i];
    arr[i] = tmp;
  }

  return arr;
}

export function randomValue<T>(arr: Array<T>): T {
  return arr[Math.floor(Math.random()*arr.length)];
}
