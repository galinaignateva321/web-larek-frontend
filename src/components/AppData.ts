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
	shop: IProduct[];
};

export class AppState extends Model<IAppState> {
	shop: IProduct[] = [];
	basket: IProduct[] = [];
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
		this.shop = items;
		this.emitChanges('products:changed', { shop: this.shop });
	}

	//добавить товар в корзину
	addProductToBasket(item: IProduct) {
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
	removeItemFromBasket(item: IProduct) {
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

	// Проверка заполненности
	isFilledOrderInputs(): boolean {
		return !!this.order.address && !!this.order.payment;
	}
	// Проверка заполненности
	isFilledContactsInputs(): boolean {
		return !!this.order.email && !!this.order.phone;
	}
}
