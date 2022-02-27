export const convertEventId = (value: number) => {
	return `${value}`.padStart(8, '0');
};
