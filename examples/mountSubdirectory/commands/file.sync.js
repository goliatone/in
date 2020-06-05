'use strict';


class FileSyncCommand {
    execute(event) {
        const context = event.context;
        const logger = context.getLogger();

    }

}

FileSyncCommand.ID = 'FileSyncCommand';

module.exports = FileSyncCommand;