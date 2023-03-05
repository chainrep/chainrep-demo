<script lang="ts">
  export let inputName = `input-${Date.now()}-${Math.floor(Math.random() * 0xffff)}`;
  export let label: string;
  export let value: string;
  export let placeholder = label;
</script>

<label for="{inputName}">
  <span>{label}:</span>
  <input type="text" name="{inputName}" bind:value={value} {placeholder}>
</label>

<style>
  label {
    display: block;
    background-color: var(--c0);
    border-radius: var(--border-radius);
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    max-width: 600px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  label > span {
    flex: 1 1;
  }

  label > input {
    flex: 1 0 auto;
  }

  input:focus {
    outline: none;
  }
</style>