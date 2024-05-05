const MAGIC = 0xcafebabe;

const validateMagic = (magic: number): never | void => {
  if (magic !== MAGIC) {
    throw new Error(
      `Invalid magic number: ${magic.toString(16)} expected ${MAGIC.toString(
        16
      )}`
    );
  }
};
