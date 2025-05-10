export function parseAttributeHash(propertiesHash: string): Record<string, string> {
  if (!propertiesHash) return {};

  const attributes: Record<string, string> = {};
  const pairs = propertiesHash.split(",");

  pairs.forEach((pair) => {
    const [key, value] = pair.split(":");
    if (key && value) {
      attributes[key.trim()] = value.trim();
    }
  });

  return attributes;
}