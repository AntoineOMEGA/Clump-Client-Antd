<template>
  <a-float-button type="primary" @click="noteEditOverlayVisible = !noteEditOverlayVisible"
    style="height: 60px; width: 60px">
    <template #icon>
      <PlusOutlined style="font-size: 20px" />
    </template>
  </a-float-button>

  <div style="margin: 10px; margin-bottom: 15px">
    <a-input size="large" addonBefore="Search" v-model:value="noteFilterSettings.search"></a-input>
  </div>

  <template v-for="note in notes" :key="note._id">
    <a-badge-ribbon :text="note.type" :color="note.color" style="right: 5px">
      <a-card :title="note.title" style="margin: 10px">
        <template #extra>
          <edit-outlined style="font-size: 1.5rem; margin-top: 20px" key="edit" @click="configureNoteForm(note)" />
        </template>
        <p>{{ note.note }}</p>
      </a-card>
    </a-badge-ribbon>
  </template>

  <a-drawer v-model:open="noteEditOverlayVisible" @close="resetNoteForm()">
    <a-form>
      <div class="mb-2">
        Title
        <a-input size="large" v-model:value="noteFormData.title"></a-input>
      </div>

      <div class="mb-2">
        Note
        <a-textarea autosize v-model:value="noteFormData.note"></a-textarea>
      </div>

      <div class="mb-2">
        Tag
        <a-select size="large" v-model:value="noteFormData.tagIDs" style="width: 100%" mode="multiple">
          <a-select-option v-for="tag in tags" :value="tag._id" :key="tag._id">
            {{ tag.title }}
          </a-select-option>
        </a-select>
      </div>

      <a-alert message="Error" :description="noteFormErrorMessage" type="error" class="mb-2"
        v-if="noteFormErrorMessage != ''" />

      <a-flex justify="space-around" align="middle" gap="middle">
        <a-button type="primary" size="large" block v-if="!noteFormData._id" @click="createNote()">Create</a-button>
        <a-button type="primary" size="large" block v-if="noteFormData._id" @click="updateNote()">Save</a-button>
        <a-button type="primary" size="large" block danger v-if="noteFormData._id"
          @click="deleteNote()">Delete</a-button>
      </a-flex>
    </a-form>
  </a-drawer>
</template>

<script setup>
import { PlusOutlined, EditOutlined } from '@ant-design/icons-vue';
</script>

<script>
export default {
  mounted() {
    this.getNotes();
  },
  data() {
    return {
      noteEditOverlayVisible: false,
      noteFormData: {
        title: '',
        note: '',
        tagIDs: []
      },
      noteFormErrorMessage: '',
      notes: [],
      noteFilterSettings: {
        details: false,
        search: ''
      }
    };
  },
  methods: {
    resetNoteForm() {
      this.noteEditOverlayVisible = false;
      this.noteFormData = {
        title: '',
        note: '',
        tagIDs: []
      };
      this.noteFormErrorMessage = '';
    },
    getNotes() {
      fetch('/api/v1/notes', {
        method: 'GET'
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 200) {
            this.notes = data.data.notes;
          }
        });
      });
    },
    createNote() {
      fetch('/api/v1/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: this.noteFormData.title,
          note: this.noteFormData.note,
          tagIDs: this.noteFormData.tagIDs,
        })
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 201) {
            this.notes.push(data.data.note);
            this.resetNoteForm();
          } else {
            this.noteFormErrorMessage = data.message;
          }
        });
      });
    },
    configureNoteForm(note) {
      this.noteFormData.title = note.title;
      this.noteFormData.note = note.note;
      this.noteFormData.tagIDs = note.tagIDs;
      this.noteFormData._id = note._id;

      this.noteEditOverlayVisible = true;
    },
    updateNote() {
      fetch('/api/v1/notes/' + this.noteFormData._id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: this.noteFormData.title,
          note: this.noteFormData.note,
          tagIDs: this.noteFormData.tagIDs
        })
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 200) {
            let indexOfUpdatedNote = this.notes.findIndex((note) => note._id === data.data.note._id);
            this.notes[indexOfUpdatedNote] = data.data.note;

            this.resetNoteForm();
          } else {
            this.noteFormErrorMessage = data.message;
          }
        });
      });
    },
    deleteNote() {
      fetch('/api/v1/notes/' + this.noteFormData._id, {
        method: 'DELETE'
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 204) {
            this.getSchedules();
            this.getNotes();
            this.resetNoteForm();
          } else {
            this.noteFormErrorMessage = data.message;
          }
        });
      });
    }
  }
};
</script>
