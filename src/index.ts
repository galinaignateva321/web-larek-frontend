import './scss/styles.scss';

import { EventEmitter } from './components/base/events';
import { API_URL, CDN_URL } from './utils/constants';
import { Modal } from './components/common/Modal';
import { ProductAPI } from './components/LarekAPI';
import {
	AppState,
	CatalogChangeEvent,
	ProductItem,
} from './components/AppData';
import { Page } from './components/Page';
import { Card, PreviewItem, ShopItem, BasketItem } from './components/Card';
import { cloneTemplate, createElement, ensureElement } from './utils/utils';
import { Basket } from './components/Basket';
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
events.on('card:selected', (item: ProductItem) => {
	const card = new PreviewItem(cloneTemplate(cardPreviewTemplate), {
		onClick: () => {
			events.emit('basket:changed', item);
			appData.addProductToBasket(item);
			appData.getBasketAmount();
			// page.counter = appData.getBasketProducts().length;
			modal.close();
		},
	});
	if (item.status === 'inBasket') {
		card.setDisabled(card.button, true);
		return modal.render({
			content: card.render({
				image: item.image,
				category: item.category,
				title: item.title,
				description: item.description,
				price: item.price,
			}),
		});
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

//Добавляем товар в корзину
events.on('basket:changed', (item: ProductItem) => {
	appData.addProductToBasket(item);
	page.counter = appData.getBasketAmount();
	modal.close();
});

// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
	page.locked = true;
});

// ... и разблокируем
events.on('modal:close', () => {
	page.locked = false;
});

//модалка корзины
events.on('basket:open', () => {
	const basketItems = appData.getBasketProducts().map((item) => {
		const basketItem = new BasketItem(cloneTemplate(cardBasketTemplate), {
			onClick: () => {
				events.emit('item:remove', item);
			},
		});
		return basketItem.render({
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

//удаление товара из корзины
events.on('item:remove', (item: ProductItem) => {
	appData.removeItemFromBasket(item);
	basket.total = appData.getTotal();
	page.counter = appData.getBasketAmount();
});
