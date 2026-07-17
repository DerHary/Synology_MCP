import { SynologyClient } from "../core/synology-client.js";

export class ContactsService {
  constructor(private readonly client: SynologyClient) {}

  async listBooks() {
    return this.client.callAny([
      { api: "SYNO.Contacts.Addressbook", method: "list", version: 1, session: "Contacts" },
      { api: "SYNO.SynologyContacts.Addressbook", method: "list", version: 1, session: "Contacts" },
    ]);
  }

  async search(query: string, addressBookId?: string) {
    return this.client.callAny([
      { api: "SYNO.Contacts.Contact", method: "list", version: 2, session: "Contacts" },
      { api: "SYNO.Contacts.Contact", method: "search", version: 2, session: "Contacts" },
    ], {
      keyword: query,
      address_book_id: addressBookId,
    });
  }

  async create(contact: Record<string, unknown>) {
    return this.client.callAny([
      { api: "SYNO.Contacts.Contact", method: "create", version: 2, session: "Contacts" },
    ], contact);
  }

  async update(contactId: string, patch: Record<string, unknown>) {
    return this.client.callAny([
      { api: "SYNO.Contacts.Contact", method: "update", version: 2, session: "Contacts" },
    ], {
      contact_id: contactId,
      ...patch,
    });
  }

  async delete(contactId: string) {
    return this.client.callAny([
      { api: "SYNO.Contacts.Contact", method: "delete", version: 2, session: "Contacts" },
    ], {
      contact_id: contactId,
    });
  }
}
