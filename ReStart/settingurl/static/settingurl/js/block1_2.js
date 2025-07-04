// --- Утилиты ---
function formatDate(dateStr) {
    if (!dateStr.includes("-")) return dateStr;
    let parts = dateStr.split('-');
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
}

function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// --- Сохранение всех данных ---
function saveData() {
    const events = [];

    // Основное мероприятие
    const firstEvent = {
        name: document.getElementById('event-name').value,
        student_count_all: parseInt(document.getElementById('student-count-all').value),
        student_count_organization: parseInt(document.getElementById('student-count-organization').value),
        date: formatDate(document.getElementById('event-date').value),
        is_official: false
    };
    //events.push(firstEvent);

    // Дополнительные мероприятия
    const container = document.querySelectorAll('.form') [0];
    const inputs = container.querySelectorAll('.step-content');
    for (let i = 0; i < inputs.length; i += 4) {
        const name = inputs[i].querySelector('input')?.value;
        const all = inputs[i + 1].querySelector('input')?.value;
        const date = inputs[i + 2].querySelector('input')?.value;
        const org = inputs[i + 3].querySelector('input')?.value;

        if (name && all && date && org) {
            events.push({
                name,
                student_count_all: parseInt(all),
                student_count_organization: parseInt(org),
                date: formatDate(date),
                is_official: false
            });
        }
    }
    console.log(events)
    const reportData = JSON.parse(localStorage.getItem('reportData')) || {};
    reportData.events = events;

    localStorage.setItem('reportData', JSON.stringify(reportData));
}

// --- Сохранение полей формы в localStorage ---
function saveFormFields() {
    const formFields = {
        eventName: document.getElementById('event-name')?.value || '',
        studentCountAll: document.getElementById('student-count-all')?.value || '',
        eventDate: document.getElementById('event-date')?.value || '',
        studentCountOrganization: document.getElementById('student-count-organization')?.value || '',
        fileName: document.getElementById('fileInputPosition')?.files?.[0]?.name || ''
    };
    localStorage.setItem('formFields_position', JSON.stringify(formFields));
}

// --- Загрузка сохранённых данных ---
function loadFormFieldskglgfklkfk() {
    const formFields = JSON.parse(localStorage.getItem('formFields_position'));
    if (!formFields) return;

    document.getElementById('event-name').value = formFields.eventName || '';
    document.getElementById('student-count-all').value = formFields.studentCountAll || '';
    document.getElementById('event-date').value = formFields.eventDate || '';
    document.getElementById('student-count-organization').value = formFields.studentCountOrganization || '';

    if (formFields.fileName) {
        const label = document.createElement('div');
        label.textContent = `Ранее выбран файл: ${formFields.fileName}`;
        label.style.fontSize = '14px';
        label.style.marginTop = '6px';
        label.style.color = 'gray';
        document.getElementById('fileInputPosition').insertAdjacentElement('afterend', label);
    }
}

// --- Динамическое добавление мероприятий ---
document.querySelector('.button-add').addEventListener('click', () => {
    const container = document.getElementById('extra-events-container');
    const nextIndex = container.querySelectorAll('.event-group').length + 2;

    const groupWrapper = document.createElement('div');
    groupWrapper.classList.add('event-group');

    for (let i = 0; i < 4; i++) {
        const step = document.createElement('div');
        step.classList.add('step');
        step.innerHTML = `
            <div class="step-number">${nextIndex}.${i + 1}</div>
            <div class="step-content">
                <label class="step-description">${getLabel(i)}</label>
                <input type="${getInputType(i)}" class="form-input" placeholder="${getPlaceholder(i)}">
            </div>`;
        groupWrapper.appendChild(step);
    }

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.classList.add('button-delete');
    deleteButton.textContent = 'Удалить мероприятие';
    deleteButton.style.margin = '10px 0';
    deleteButton.addEventListener('click', () => {
        groupWrapper.remove();
        renumberEventGroups();
    });

    groupWrapper.appendChild(deleteButton);
    container.appendChild(groupWrapper);
});

function renumberEventGroups() {
    const groups = document.querySelectorAll('.event-group');
    groups.forEach((group, groupIndex) => {
        const steps = group.querySelectorAll('.step-number');
        steps.forEach((el, stepIndex) => {
            el.innerText = `${groupIndex + 2}.${stepIndex + 1}`;
        });
    });
}

function getLabel(i) {
    return ["Название мероприятия", "Количество участников мероприятия", "Дата проведения", "Количество участников Школьного спортивного клуба"][i];
}
function getInputType(i) {
    return (i === 2) ? "date" : (i === 0 ? "text" : "number");
}
function getPlaceholder(i) {
    return (i === 0) ? "Введите название мероприятия" : ((i === 1 || i === 3) ? "Введите число" : "");
}

// --- Состояние формы и предупреждение ---
let isFormEdited = true;
function beforeUnloadHandler(e) {
    if (isFormEdited) {
        e.preventDefault();
        e.returnValue = 'Вы действительно хотите уйти со страницы?';
        return 'Вы действительно хотите уйти со страницы?';
    }
}
window.addEventListener('beforeunload', beforeUnloadHandler);

// --- Загрузка, кнопки и обработчики ---
document.addEventListener('DOMContentLoaded', () => {
    loadFormFields();

    const inputs = ['event-name', 'student-count-all', 'event-date', 'student-count-organization'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', () => {
            saveFormFields();
            isFormEdited = true;
        });
    });

    const attachPositionButton = document.getElementById('attach-position');
    const fileInputPosition = document.getElementById('fileInputPosition');
    //attachPositionButton.addEventListener('click', () => fileInputPosition.click());

    /*fileInputPosition.addEventListener('change', async function () {
        const file = fileInputPosition.files[0];
        if (file) {
            alert(`Вы выбрали файл: ${file.name}`);
            const fileBase64 = await readFileAsBase64(file);
            const reportData = JSON.parse(localStorage.getItem('reportData')) || {};
            reportData.position = fileBase64;
            localStorage.setItem('reportData', JSON.stringify(reportData));
            saveFormFields();
        }
    });*/

    const saveAndExit = async () => {
         saveData();
        isFormEdited = false;
        window.removeEventListener('beforeunload', beforeUnloadHandler);
    };

    document.querySelector('.button-next')?.addEventListener('click', saveAndExit);
    document.querySelector('.button-back')?.addEventListener('click', saveAndExit);
});

// --- Меню профиля ---
document.addEventListener('DOMContentLoaded', () => {
    const profileIcon = document.getElementById('profile-icon');
    const profileMenu = document.getElementById('profile-menu');

    profileIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        profileMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
        if (!profileMenu.classList.contains('hidden')) {
            profileMenu.classList.add('hidden');
        }
    });
});


function loadFormFields() {
    var reportData = JSON.parse(localStorage.getItem('reportData'));
        if (!reportData || !Array.isArray(reportData.events) || reportData.events.length == 0) {
            reportData = { events: JSON.parse(localStorage.getItem('oldEvents')) };
            if (!Array.isArray(reportData.events)) return;
        }
    const mainEvent = reportData.events.find(e => e.is_official === false);
    if (!mainEvent) return;
    // Берём первое событие (основное)
    //const mainEvent = reportData.events[0];
    if (mainEvent) {
        document.getElementById('event-name').value = mainEvent.name || '';
        document.getElementById('student-count-all').value = mainEvent.student_count_all || '';
        // дата в формате ISO, нужно преобразовать для input[type=date]
        if (mainEvent.date) {
            const dateOnly = mainEvent.date.split('T')[0];
            document.getElementById('event-date').value = dateOnly;
        } else {
            document.getElementById('event-date').value = '';
        }
        document.getElementById('student-count-organization').value = mainEvent.student_count_organization || '';
    }

    // Дополнительные мероприятия подгружаются динамически (если есть)
    const container = document.getElementById('extra-events-container');
    if (!container) return;

    // Удаляем все текущие группы кроме первой (основной)
    container.querySelectorAll('.event-group').forEach(group => group.remove());

    for (let i = 1; i < reportData.events.length; i++) {
        const event = reportData.events[i];
        const groupWrapper = document.createElement('div');
        groupWrapper.classList.add('event-group');

        // Создаём поля в группе
        const fields = [
            { label: 'Название мероприятия', value: event.name || '', type: 'text' },
            { label: 'Количество участников мероприятия', value: event.student_count_all || '', type: 'number' },
            { label: 'Дата проведения', value: event.date ? event.date.split('T')[0] : '', type: 'date' },
            { label: 'Количество участников Школьного спортивного клуба', value: event.student_count_organization || '', type: 'number' }
        ];

        fields.forEach((field, index) => {
            const step = document.createElement('div');
            step.classList.add('step');

            const stepNumber = document.createElement('div');
            stepNumber.classList.add('step-number');
            stepNumber.textContent = `${i + 1}.${index + 1}`;

            const stepContent = document.createElement('div');
            stepContent.classList.add('step-content');

            const label = document.createElement('label');
            label.classList.add('step-description');
            label.textContent = field.label;

            const input = document.createElement('input');
            input.type = field.type;
            input.classList.add('form-input');
            input.value = field.value;

            stepContent.appendChild(label);
            stepContent.appendChild(input);
            step.appendChild(stepNumber);
            step.appendChild(stepContent);

            groupWrapper.appendChild(step);
        });

        // Кнопка удаления
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.classList.add('button-delete');
        deleteButton.textContent = 'Удалить мероприятие';
        deleteButton.style.margin = '10px 0';
        deleteButton.addEventListener('click', () => {
            groupWrapper.remove();
            renumberEventGroups();
        });

        groupWrapper.appendChild(deleteButton);
        container.appendChild(groupWrapper);
    }

    renumberEventGroups();
}
