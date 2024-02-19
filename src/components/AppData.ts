import { Model } from './base/Model';
import {
	IProduct,
	IAppState,
	IOrder,
	IOrderForm,
	IOrderResult,
	IContactsForm,
	ProductStatus,
	IContacts,
} from '../types';

export type CatalogChangeEvent = {
	shop: ProductItem[];
};

export class ProductItem extends Model<IProduct> {
	id: string;
	description?: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
	status: ProductStatus;
	itemCount: number = 0;
	index: number = 0;
}

export class AppState extends Model<IAppState> {
	shop: ProductItem[];
	basket: ProductItem[] = [];
	order: IOrder = {
		address: '',
		items: [],
	};
	contacts: IContacts = {
		email: '',
		phone: '',
		items: [],
	};
	status: ProductStatus;

	//массив для главной страницы
	setProducts(items: IProduct[]) {
		this.shop = items.map((item) => new ProductItem(item, this.events));
		this.emitChanges('products:changed', { shop: this.shop });
	}
	//добавить товар в корзину
	addProductToBasket(item: ProductItem) {
		if (item.status !== 'sell' && item.price !== null) {
			this.basket.push(item);
			item.itemCount = this.basket.length;
			item.status = 'inBasket';
		}
	}
	//удалить данные корзины
	clearBasketData() {
		this.basket.forEach((item) => {
			item.status = 'sell';
		});
		this.basket = [];
	}
	//удалить товар с корзины
	removeItemFromBasket(item: ProductItem) {
		this.basket = this.basket.filter((el) => el !== item);
	}
	//количество товаров в корзине
	getBasketAmount() {
		return this.basket.length;
	}
	//массив товаров в корзине
	getBasketProducts(): IProduct[] {
		console.log(this.basket);
		return this.basket;
	}
	//общая стоимость
	getTotal() {
		return `${this.basket.reduce((a, c) => a + c.price, 0)} синапсов`;
	}
	//текст кнопки товара, кот уже в корзине
	setButtonText() {
		return 'В корзине';
	}

	// setOrderField(field: keyof IOrderForm, value: string) {
	// 	this.order[field] = value;

	// 	if (this.validateOrder()) {
	// 		this.events.emit('order:ready', this.order);
	// 	}
	// }

	// validateOrder() {
	// 	const errors: typeof this.formErrors = {};
	// 	if (!this.order.email) {
	// 		errors.email = 'Необходимо указать email';
	// 	}
	// 	if (!this.order.phone) {
	// 		errors.phone = 'Необходимо указать телефон';
	// 	}
	// 	this.formErrors = errors;
	// 	this.events.emit('formErrors:change', this.formErrors);
	// 	return Object.keys(errors).length === 0;
	// }
}
