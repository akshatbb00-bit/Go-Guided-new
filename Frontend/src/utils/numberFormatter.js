export const formatNumberIndian = (number) => {
  if (number >= 1e7) return `${(number / 1e7).toFixed(2)} Cr`;
  if (number >= 1e5) return `${(number / 1e5).toFixed(2)} Lakh`;
  return new Intl.NumberFormat("en-IN").format(number);
};
