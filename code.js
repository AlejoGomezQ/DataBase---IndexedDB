const namesHTML = (id, name) => {
    const container = document.createElement('DIV');
    const h2 = document.createElement('h2');
    const options = document.createElement('DIV');
    const saveButton = document.createElement('button');
    const deleteButton = document.createElement('button');

    container.classList.add('nombre');
    options.classList.add('options');
    saveButton.classList.add('imposible');
    deleteButton.classList.add('delete');

    saveButton.textContent = 'Guardar';
    deleteButton.textContent = 'Eliminar';

    h2.textContent = name.nombre;
    h2.setAttribute('contenteditable', true);
    h2.setAttribute('spellcheck', false);

    //AGREGUE LOS BOTONES AL DIV OPTIONS
    options.appendChild(saveButton);
    options.appendChild(deleteButton);

    //AGREGUE EL H2 Y EL CONTENEDOR OPTIONS AL DIV CONTAINER
    container.appendChild(h2);
    container.appendChild(options);

    h2.addEventListener('keyup', () => {
        saveButton.classList.replace('imposible', 'posible');
    })

    saveButton.addEventListener('click', () => {
        if(saveButton.className == 'posible') {
            modObj(id, { nombre: h2.textContent });
            saveButton.classList.replace('posible', 'imposible');
        }
    })

    deleteButton.addEventListener('click', () => {
        deleteObj(id);
        document.querySelector('.nombres').removeChild(container)
    })

    return container
}

const InDBRequest = indexedDB.open('AlejosBase',1);

InDBRequest.addEventListener('upgradeneeded', () => {
    const db = InDBRequest.result;
    db.createObjectStore('nombres', {
        autoIncrement: true
    })
})

InDBRequest.addEventListener('success', () => {
    readObj()
});

InDBRequest.addEventListener('error', () => {
    console.log('Ha ocurrido un error al abrir la base de datos');
});

document.getElementById('add').addEventListener('click', () => {
    let nombre = document.getElementById('nombre').value;
    if(nombre.length > 0) {
        if(document.querySelector('.posible') != undefined) {
            if(confirm('Hay elementos sin guardar. ¿Quieres continuar?')) {
                addObj({ nombre });
                readObj();
            }
        } else {
            addObj({ nombre });
            readObj();
        }
    }
})

//AGREGAR OBJETO AL ALMACEN 
const addObj = obj => {
    const db = InDBRequest.result;
    const InDBTransaction = db.transaction('nombres', "readwrite");
    const objStore = InDBTransaction.objectStore('nombres');
    objStore.add(obj);
    InDBTransaction.addEventListener('complete', () => {
        console.log('Objeto agregagado correctamente')
    })
}

//LEER OBJETO DEL ALMACEN 
const readObj = () => {
    const db = InDBRequest.result;
    const InDBTransaction = db.transaction('nombres', 'readonly');
    const objStore = InDBTransaction.objectStore('nombres');
    const cursor = objStore.openCursor();
    const fragment = document.createDocumentFragment();
    document.querySelector('.nombres').innerHTML = '';
    cursor.addEventListener('success', () => {
        if (cursor.result) {
            let element = namesHTML(cursor.result.key, cursor.result.value)
            fragment.appendChild(element);
            cursor.result.continue();
        } else document.querySelector(".nombres").appendChild(fragment);
    })
}

// MODIFICAR OBJETO DEL ALMACEN 
const modObj = (key, obj) => {
    const db = InDBRequest.result;
    const InDBTransaction = db.transaction('nombres', "readwrite");
    const objStore = InDBTransaction.objectStore('nombres');
    objStore.put(obj, key);
    InDBTransaction.addEventListener('complete', () => {
        console.log('Objeto modificado correctamente')
    })
}

// ELIMINAR OBJETO DEL ALMACEN 
const deleteObj = key => {
    const db = InDBRequest.result;
    const InDBTransaction = db.transaction('nombres', "readwrite");
    const objStore = InDBTransaction.objectStore('nombres');
    objStore.delete(key);
    InDBTransaction.addEventListener('complete', () => {
        console.log('Objeto eliminado correctamente')
    })
}