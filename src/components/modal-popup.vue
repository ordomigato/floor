<template>
    <div class="modal-container">
        <div class="modal">
            <slot></slot>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.modal-container {
    background-color: rgba(0,0,0,0.8);
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    .modal {
        min-width: 300px;
        max-width: 80%;
        background-color: white;
        padding: 1rem;
        border-radius: 10px;
        box-shadow: 0 6px 12px black;
    }
}
</style>