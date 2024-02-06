<template>
    <main>
        <div class="card">
            <h2>Games Page</h2>
            <button
                @click="$router.push({ name: 'game-create' })"
            >
                Create Game
            </button>
            <div>
                <table>
                    <thead>
                        <tr>
                            <th align="left">
                                Name
                            </th>
                            <th align="right">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Game Name</td>
                            <td align="right">
                                <button>
                                    Edit
                                </button>
                                <button>
                                    Play
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </main>
</template>
<style lang="scss">
table {
    margin-top: 2rem;
    width: 100%;
    border: 1px solid var(--primary-color);
    border-spacing: 0;
    thead {
        background-color: var(--primary-color);
        tr {
            th {
                padding: 1rem;
            }
        }
    }
    tbody {
        tr {
            td {
                padding: 1rem;
            }
        }
    }
}
</style>
