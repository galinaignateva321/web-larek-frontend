import { IEvents, IContactsForm } from '../types';
import { Form } from './common/Form';

export class Contacts extends Form<IContactsForm> {
	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);
	}
	set phone(value: string) {
		(this.container.elements.namedItem('phone') as HTMLInputElement).value =
			value;
	}

	set email(value: string) {
		(this.container.elements.namedItem('email') as HTMLInputElement).value =
			value;
	}
	clearContacts() {
		(this.container.elements.namedItem('phone') as HTMLInputElement).value = '';
		(this.container.elements.namedItem('email') as HTMLInputElement).value = '';
	}
}
