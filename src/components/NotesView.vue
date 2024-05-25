<template>
  <a-float-button type="primary" @click="noteEditOverlayVisible = !noteEditOverlayVisible" style="height: 60px; width: 60px">
    <template #icon>
      <PlusOutlined style="font-size: 20px" />
    </template>
  </a-float-button>

  <div style="margin: 10px; margin-bottom: 15px">
    <a-input size="large" addonBefore="Search" v-model:value="noteFilterSettings.search"></a-input>
  </div>

  <template v-for="note in notes" :key="note._id">
    <a-card :title="note.title" style="margin: 10px" :bodyStyle="{ padding: '0' }">
      <template #extra>
        <edit-outlined style="font-size: 1.5rem" key="edit" @click="configureNoteForm(note)" />
      </template>
      <p style="padding: 10px; margin: 0 !important">{{ note.note }}</p>
      <div style="padding: 10px; background-color: #333333" v-if="note.tagIDs.length > 0">
        <a-tag v-for="tagID in note.tagIDs" :key="tagID" :color="tags[tags.findIndex((tag) => tag._id === tagID)].color">
          {{ tags[tags.findIndex((tag) => tag._id === tagID)].title }}
        </a-tag>
      </div>
    </a-card>
  </template>

  <a-drawer v-model:open="noteEditOverlayVisible" @close="resetNoteForm()">
    <a-form>
      <div class="mb-2">
        Title
        <a-input size="large" v-model:value="noteFormData.title"></a-input>
      </div>

      <div class="mb-2">
        Note
        <a-textarea :auto-size="{ minRows: 2, maxRows: 6 }" v-model:value="noteFormData.note"></a-textarea>
      </div>

      <div class="mb-2">
        Tag
        <a-select size="large" v-model:value="noteFormData.tagIDs" style="width: 100%" mode="multiple">
          <a-select-option v-for="tag in tags" :value="tag._id" :key="tag._id">
            {{ tag.title }}
          </a-select-option>
        </a-select>
      </div>

      <a-alert message="Error" :description="noteFormErrorMessage" type="error" class="mb-2" v-if="noteFormErrorMessage != ''" />

      <a-flex justify="space-around" align="middle" gap="middle">
        <a-button type="primary" size="large" block v-if="!noteFormData._id" @click="createNote()">Create</a-button>
        <a-button type="primary" size="large" block v-if="noteFormData._id" @click="updateNote()">Save</a-button>
        <a-button type="primary" size="large" block danger v-if="noteFormData._id" @click="deleteNote()">Delete</a-button>
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
    this.getTags();
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
      },
      tags: []
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
          tagIDs: this.noteFormData.tagIDs
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
    },
    getTags() {
      fetch('/api/v1/tags', {
        method: 'GET'
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 200) {
            this.tags = data.data.tags;
          }
        });
      });
    }
  }
};
</script>
