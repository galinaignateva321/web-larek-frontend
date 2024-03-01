//Интерфейсы для данных

//данные товара
export interface IProduct {
	id: string;
	description?: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
	status: ProductStatus;
	itemCount: number;
	index: number;
}

//cтатус товара
export type ProductStatus = 'onSale' | 'inBasket' | 'sell';

//интерфейс работы с данными
export interface IAppState {
	shop: IProduct[];
	basket: IProduct[];
	status: ProductStatus;
	order: IOrder;
}

//данные товара с API
export interface IProductAPI {
	getProductList: () => Promise<IProduct[]>;
	getProductItem: (id: string) => Promise<IProduct>;
	orderProducts: (order: IOrder) => Promise<IOrderResult>;
}

//id заказываемого товара
export interface IOrderResult {
	id: string;
}

//Интерфейсы для отображения

//главная страница
export interface IPage {
	counter: number;
	products: HTMLElement[];
	locked: boolean;
}

//карточка при клике
export interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

//карточка
export interface ICard<T> {
	category: string;
	title: string;
	description?: string;
	image?: string;
	price: number | null;
	buttonText: string;
	index?: number;
}

//состояние карточки при каталоге
export type ShopItemType = {
	label: string;
};

//состояние карточки при модалке
export type PreviewItemType = {
	label: string;
};

//состояние карточки в корзине
export type BasketItemType = {
	title: string;
	price: number;
	index: number;
};

//корзина
export interface IBasketView {
	list: HTMLElement[];
	total: number | string;
	selected: string[];
	index: HTMLElement;
	button: HTMLButtonElement;
}

//модалка
export interface IModal {
	content: HTMLElement;
}

//форма
export interface IForm {
	valid: boolean;
	errors: string[];
}

//заказ все инпуты
export interface IOrderForm {
	address: string;
	payment: string;
	email: string;
	phone: string;
}

//контакты
export interface IContactsForm {
	email: string;
	phone: string;
}
//для данных заказа
export interface IOrder extends IOrderForm {
	items: string[];
	total: number;
}
//результат заказа
export interface ISuccess {
	description: number;
}

//Events Слой презентера (Presenter)
export type EventName = string | RegExp;
export type Subscriber = Function;
export type EmitterEvent = {
	eventName: string;
	data: unknown;
};
export interface IEvents {
	on<T extends object>(event: EventName, callback: (data: T) => void): void;
	emit<T extends object>(event: string, data?: T): void;
	trigger<T extends object>(
		event: string,
		context?: Partial<T>
	): (data: T) => void;
}
export type FormErrors = Partial<Record<keyof IOrder, string>>;
