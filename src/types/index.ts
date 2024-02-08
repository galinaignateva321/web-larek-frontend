export interface IPage {
	counter: number;
	products: HTMLElement[];
	locked: boolean;
}

export interface ICard<T> {
	category: string;
	title: string;
	image: string;
	price: number | null;
}

export interface IProduct {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
}

export interface IBasket {
	items: HTMLElement[];
	total: number;
}

export interface IAddress {
	payment: string;
	address: string;
}

export interface IOrderForm {
	email: string;
	phone: string;
}

export interface IOrderResult {
	id: string;
}
