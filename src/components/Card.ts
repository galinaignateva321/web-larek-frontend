import { Component } from './base/Component';
import {
	ICard,
	ICardActions,
	ShopItemType,
	PreviewItemType,
	IEvents,
	BasketItemType,
} from '../types';
import { ensureElement } from '../utils/utils';
import { EventEmitter } from './base/events';

export class Card<T> extends Component<ICard<T>> {
	protected _category: HTMLElement;
	protected _title: HTMLElement;
	protected _image?: HTMLImageElement;
	protected _description?: HTMLElement;
	protected _price: HTMLElement;
	button?: HTMLButtonElement;
	protected _buttonText?: string;

	constructor(
		protected blockName: string,
		container: HTMLElement,
		actions?: ICardActions,
		events?: IEvents
	) {
		super(container);

		this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
		this._image = container.querySelector(`.${blockName}__image`);
		this.button = container.querySelector(`.${blockName}__button`);
		this._description = container.querySelector(`.${blockName}__text`);
		this._price = container.querySelector(`.${blockName}__price`);
		this._category = container.querySelector(`.${blockName}__category`);

		if (actions?.onClick) {
			if (this.button) {
				this.button.addEventListener('click', actions.onClick);
			} else {
				container.addEventListener('click', actions.onClick);
			}
		}
	}

	set category(value: string) {
		this.setText(this._category, value);
	}

	get category(): string {
		return this._category.textContent || '';
	}

	set id(value: string) {
		this.container.dataset.id = value;
	}

	get id(): string {
		return this.container.dataset.id || '';
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	get title(): string {
		return this._title.textContent || '';
	}

	set image(value: string) {
		this.setImage(this._image, value, this.title);
	}

	set description(value: string | string[]) {
		this.setText(this._description, value);
	}

	set price(value: number | null) {
		if (value !== null) {
			const priceView = `${value} синапсов`;
			this.setText(this._price, priceView);
		} else {
			this.setText(this._price, 'Бесценно');
		}
	}

	set buttonText(value: string) {
		this.setText(this.button, value);
	}
}

//товар в отображении каталога
export class ShopItem extends Card<ShopItemType> {
	constructor(container: HTMLElement, actions?: ICardActions) {
		super('card', container, actions);
	}
}

//товар в отображении модалки товара
export class PreviewItem extends Card<PreviewItemType> {
	constructor(container: HTMLElement, actions?: ICardActions) {
		super('card', container, actions);
		this.button = ensureElement<HTMLButtonElement>('.card__button', container);
	}
}

//товар в отображении корзины
export class BasketItem extends Card<BasketItemType> {
	// protected _index: HTMLElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super('card', container, actions);
		// this._index = container.querySelector(`.basket__item-index`);
	}

	// set index(value: number) {
	// 	this._index.textContent = value.toString();
	// }
}
