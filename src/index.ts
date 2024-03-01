import './scss/styles.scss';

import { EventEmitter } from './components/base/events';
import { API_URL, CDN_URL } from './utils/constants';
import { Modal } from './components/common/Modal';
import { ProductAPI } from './components/LarekAPI';
import { AppState, CatalogChangeEvent } from './components/AppData';
import { Page } from './components/Page';
import { PreviewItem, ShopItem, BasketItem } from './components/Card';
import { cloneTemplate, ensureElement } from './utils/utils';
import { Basket } from './components/Basket';
import { Order } from './components/Order';
import { Contacts } from './components/Contacts';
import { Success } from './components/Success';
import { IOrder, IOrderForm, IProduct } from './types';
const events = new EventEmitter();
const api = new ProductAPI(CDN_URL, API_URL);

// Все шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Модель данных приложения
const appData = new AppState({}, events);

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new Order(cloneTemplate(orderTemplate), events);
const contacts = new Contacts(cloneTemplate(contactsTemplate), events);

// Дальше идет бизнес-логика
// Поймали событие, сделали что нужно

// Изменились элементы каталога
events.on<CatalogChangeEvent>('products:changed', () => {
	page.shop = appData.shop.map((item) => {
		const card = new ShopItem(cloneTemplate(cardCatalogTemplate), {
			onClick: () => events.emit('card:selected', item),
		});
		return card.render({
			category: item.category,
			title: item.title,
			image: item.image,
			price: item.price,
		});
	});
});

// Получаем товары с сервера
api
	.getProductList()
	.then(appData.setProducts.bind(appData))
	.catch((err) => {
		console.error(err);
	});

// Открыть продукт
events.on('card:selected', (item: IProduct) => {
	const card = new PreviewItem(cloneTemplate(cardPreviewTemplate), {
		onClick: () => {
			events.emit('item:add', item);
			modal.close();
		},
	});
	if (item.status === 'inBasket') {
		card.setDisabled(card.button, true);
		card.setText(card.button, 'В корзине');
	}
	if (item.status === 'sell') {
		card.setDisabled(card.button, true);
		card.setText(card.button, 'Продано');
	}
	return modal.render({
		content: card.render({
			image: item.image,
			category: item.category,
			title: item.title,
			description: item.description,
			price: item.price,
		}),
	});
});

//корзина
events.on('basket:changed', () => {
	page.counter = appData.getBasketAmount();
	const basketItems = appData.getBasketProducts().map((item, i) => {
		const basketItem = new BasketItem(cloneTemplate(cardBasketTemplate), {
			onClick: () => {
				events.emit('item:remove', item);
			},
		});
		return basketItem.render({
			index: i + 1,
			title: item.title,
			price: item.price,
		});
	});
	modal.render({
		content: basket.render({
			list: basketItems,
			total: appData.getTotal(),
		}),
	});
});

//добавить товар в корзину
events.on('item:add', (item: IProduct) => {
	appData.addProductToBasket(item);
});

//удаление товара из корзины
events.on('item:remove', (item: IProduct) => {
	appData.removeItemFromBasket(item);
});

//оформление заказа
events.on('order:open', () => {
	modal.render({
		content: order.render({
			address: '',
			valid: appData.isFilledOrderInputs(),
			errors: [],
		}),
	});
});

// Изменилось состояние валидации формы заказа
events.on('orderFormErrors:change', (errors: Partial<IOrder>) => {
	const { payment, address } = errors;
	order.valid = !payment && !address;
	order.errors = Object.values({ payment, address })
		.filter((i) => !!i)
		.join('; ');
});

// Изменилось одно из полей
events.on(
	/^order\..*:change/,
	(data: { field: keyof IOrderForm; value: string }) => {
		appData.setOrderField(data.field, data.value);
	}
);

//ввод  контактов
events.on('order:submit', () => {
	appData.order.total = appData.getTotal();
	appData.setItems();
	modal.render({
		content: contacts.render({
			valid: appData.isFilledContactsInputs(),
			errors: [],
		}),
	});
});

// Изменилось состояние валидации формы ввода контактов
events.on('contactsFormErrors:change', (errors: Partial<IOrder>) => {
	const { email, phone } = errors;
	contacts.valid = !email && !phone;
	contacts.errors = Object.values({ phone, email })
		.filter((i) => !!i)
		.join('; ');
});

// Изменилось одно из полей
events.on(
	/^contacts\..*:change/,
	(data: { field: keyof IOrderForm; value: string }) => {
		appData.setOrderField(data.field, data.value);
	}
);

// Отправлена форма заказа
events.on('contacts:submit', () => {
	api
		.orderProducts(appData.order)
		.then(() => {
			const success = new Success(cloneTemplate(successTemplate), {
				onClick: () => {
					modal.close();
				},
			});

			modal.render({
				content: success.render({
					description: appData.getTotal(),
				}),
			});
			appData.clearBasketData();
			page.counter = 0;
		})
		.catch((err) => {
			console.error(err);
		})
		.finally(() => {
			order.clearOrder();
			order.offActiveButtons();
			contacts.clearContacts();
			appData.clearOrderData();
		});
});

// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
	page.locked = true;
});

// ... и разблокируем
events.on('modal:close', () => {
	page.locked = false;
});
