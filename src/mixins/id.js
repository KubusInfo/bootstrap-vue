// SSR safe client-side ID attribute generation
// ID's can only be generated client-side, after mount
import { Vue } from '../vue'
import { PROP_TYPE_STRING } from '../constants/props'
import { makeProp } from '../utils/props'

// --- Props ---

export const props = {
  id: makeProp(PROP_TYPE_STRING)
}

// --- Mixin ---

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
  )
}

// @vue/component
export const idMixin = Vue.extend({
  props,
  data() {
    return {
      localId_: null
    }
  },
  computed: {
    safeId() {
      // Computed property that returns a dynamic function for creating the ID
      // Reacts to changes in both `.id` and `.localId_` and regenerates a new function
      const id = this.id || this.localId_

      // We return a function that accepts an optional suffix string
      // So this computed prop looks and works like a method
      // but benefits from Vue's computed prop caching
      const fn = suffix => {
        if (!id) {
          return null
        }
        suffix = String(suffix || '').replace(/\s+/g, '_')
        return suffix ? id + '_' + suffix : id
      }
      return fn
    }
  },
  mounted() {
    // `mounted()` only occurs client-side
    this.$nextTick(() => {
      // Update DOM with auto-generated ID after mount
      // to prevent SSR hydration errors
      this.localId_ = `__BVID__${uuidv4()}`
    })
  }
})
