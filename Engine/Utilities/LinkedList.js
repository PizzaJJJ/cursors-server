/**
 * Empty value.
 */
const NULL = null;

/**
 * Constructs a linked list's item.
 * @param {*} data A data to store in the item.
 * @param {Item} prev A previous item.
 * @param {Item} next A next item.
 */
function Item(data, prev = NULL, next = NULL) {
    this.data = data;
    this.prev = prev;
    this.next = next;
}

/**
 * Constructs a doubly linked list.
 */
class LinkedList {
    constructor() {
        this._current = this._first = this._last = NULL;
        this._length = 0;
    }

    /**
     * Removes specified item from the list.
     * @param {Item} item An item to remove.
     */
    _remove(item) {
        if (item === NULL) {
            return;
        }

        if (item.next !== NULL) {
            item.next.prev = item.prev;
        }

        if (item.prev !== NULL) {
            item.prev.next = item.next;
        }

        if (this._first === item) {
            this._first = item.next;
        }

        if (this._last === item) {
            this._last = item.prev;
        }

        this._length--;
    }

    /**
     * Clears the entire linked list.
     */
    clear() {
        this._current = this._first = this._last = NULL;
        this._length = 0;
    }
    
    /**
     * Adds data to the list's tail.
     * @param {*} data A data to store.
     */
    add(data) {
        if (this._first == NULL) {
            this._first = this._last = new Item(data);
        } else {
            this._last.next = new Item(data, this._last);
            this._last = this._last.next;
        }

        this._length++;
    }

    /**
     * Removes all provided data from the list.
     * @param {*} data A data to remove.
     */
    removeData(data) {
        var current = this._current, 
        itemData = NULL;

        // Iterating through all list items and checking for a duplication.
        this.iterate(true);
        while (itemData = this.iterate(), itemData !== NULL) {
            if (itemData === data) {
                this._remove(this._current);
            }
        }

        this._current = current;
    }

    /**
     * Extracts the first item from the list and returns its data.
     * @returns {*} Data of the first item.
     */
    extractFirstData() {
        if (this._first != NULL) {
            const data = this._first.data;
            this._remove(this._first);

            return data;
        }

        return NULL;
    }

    /**
     * Extracts the first n item from the list and returns those data as array.
     * @returns {Array} Array ofd ata of extracted items.
     */
    extractFirstDataArray(n = 0) {
        var arr = [], data;

        while (n != 0 && this._first != NULL) {
            data = this._first.data;
            this._remove(this._first);

            arr.push(data);
            n--;
        }

        return arr;
    }

    /**
     * Iterates through every item of the linked list. If a restart is necessary, 
     * only resets the iteration's pointer.
     * @param {boolean} isRestart Set true if restart is necessary.
     * @returns {*} Data of the currently iterated list's item.
     */
    iterate(isRestart) {
        // If a restart is necessary, only reset the iteration's pointer.
        if (isRestart) {
            this._current = NULL;

            return NULL;
        } else {
            if (this._current == NULL) {
                this._current = this._first;
            } else {
                this._current = this._current.next;
            }
        }

        return this.current;
    }

    /**
     * Returns all linked list's data as an array.
     * @returns {Array}
     */
    get dataArray() {
        var current = this._current,
            itemData = NULL,
            arr = [];

        // Iterating through all list items.
        this.iterate(true);
        while (itemData = this.iterate(), itemData !== NULL) {
            arr.push(itemData);
        }

        this._current = current;

        return arr;
    }

    /**
     * Data of the currently iterated list's item.
     */
    get current() {
        if (this._current == NULL) {
            return NULL;
        }

        return this._current.data;
    }

    get length() {
        return this._length;
    }
}

module.exports = LinkedList;