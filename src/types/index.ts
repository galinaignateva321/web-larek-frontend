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

export interface IProductPreview extends IProduct {
	description: string;
}
//cтатус товара
export type ProductStatus = 'inBasket' | 'sell';

//все товары на главной
export type CatalogChangeEvent = {
	shop: IProduct[];
};

//
export interface IAppState {
	shop: IProduct[];
	basket: IProduct[];
	status: ProductStatus;
}

//данные заказа
export interface IOrder extends IOrderForm {
	items: string[];
}

//данные контактов
export interface IContacts extends IContactsForm {
	items: string[];
}

//данные товара с API
export interface IProductAPI {
	getProductList: () => Promise<IProduct[]>;
	getProductItem: (id: string) => Promise<IProduct>;
	orderProducts: (order: IOrder) => Promise<IOrderResult>;
}
//результат заказа
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
//карточка
export interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

export interface ICard<T> {
	category: string;
	title: string;
	description?: string;
	image?: string;
	price: number | null;
	buttonText: string;
	itemCount?: number;
}
//состояние карточки при каталоге
export type ShopItemType = {
	label: string;
};

//состояние карточки при модалке
export type PreviewItemType = {
	label: string;
};

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
}

export interface IModal {
	content: HTMLElement;
}
//заказ
export interface IOrderForm {
	address: string;
}
//оплата
export type TapPayment = {
	onClick: (tab: string) => void;
};
//контакты
export interface IContactsForm {
	email: string;
	phone: string;
}
//результат заказа
export interface ISuccess {
	total: number;
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
