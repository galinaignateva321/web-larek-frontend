import { Model } from './base/Model';
import {
	IProduct,
	IAppState,
	IOrder,
	IOrderForm,
	ProductStatus,
	FormErrors,
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
		payment: '',
		email: '',
		phone: '',
		items: [],
		total: null,
	};
	status: ProductStatus;
	formErrors: FormErrors = {};

	//массив для главной страницы
	setProducts(items: IProduct[]) {
		this.shop = items.map((item) => new ProductItem(item, this.events));
		this.emitChanges('products:changed', { shop: this.shop });
	}

	//добавить товар в корзину
	addProductToBasket(item: ProductItem) {
		if (item.price !== null) {
			this.basket.push(item);
		}
		this.emitChanges('basket:changed');
		item.status = 'inBasket';
	}

	//удалить данные
	clearBasketData() {
		this.basket.forEach((item) => {
			item.status = 'sell';
		});
		this.basket = [];
	}

	//удалить товар с корзины
	removeItemFromBasket(item: ProductItem) {
		this.basket = this.basket.filter((el) => el.id !== item.id);
		this.emitChanges('basket:changed');
		item.status = 'onSale';
	}

	//количество товаров в корзине
	getBasketAmount() {
		return this.basket.length;
	}

	//массив товаров в корзине
	getBasketProducts(): IProduct[] {
		return this.basket;
	}

	//общая стоимость
	getTotal() {
		return this.basket.reduce((a, c) => a + c.price, 0);
	}

	//сбросить данные
	clearOrderData() {
		this.order = {
			address: '',
			payment: '',
			email: '',
			phone: '',
			items: [],
			total: null,
		};
	}

	setOrderField(field: keyof IOrderForm, value: string) {
		this.order[field] = value;

		if (this.validateContacts()) {
			this.events.emit('contacts:ready', this.order);
		}
		if (this.validateOrder()) {
			this.events.emit('order:ready', this.order);
		}
	}
	//валидации формы контактов
	validateContacts() {
		const errors: typeof this.formErrors = {};
		if (!this.order.email) {
			errors.email = 'Необходимо указать email';
		}
		if (!this.order.phone) {
			errors.phone = 'Необходимо указать телефон';
		}
		this.formErrors = errors;
		this.events.emit('contactsFormErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}

	//валидации формы заказа
	validateOrder() {
		const errors: typeof this.formErrors = {};
		if (!this.order.address) {
			errors.address = 'Необходимо указать адрес';
		}
		if (!this.order.payment) {
			errors.payment = 'Необходимо указать способ оплаты';
		}
		this.formErrors = errors;
		this.events.emit('orderFormErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}
	//id заказываемых продуктов
	setItems() {
		this.order.items = this.basket.map((item) => item.id);
	}
}
