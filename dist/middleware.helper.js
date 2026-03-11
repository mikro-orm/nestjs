import { HttpStatus } from '@nestjs/common';
export function forRoutesPath(options, consumer) {
    if (options.forRoutesPath) {
        return options.forRoutesPath;
    }
    // detect nest v11 based on a newly added enum value
    if (HttpStatus.MULTI_STATUS) {
        return '{*all}';
    }
    const isFastify = (consumer) => {
        if (typeof consumer.httpAdapter !== 'object') {
            return false;
        }
        return consumer.httpAdapter.constructor.name.toLowerCase().startsWith('fastify');
    };
    return isFastify(consumer) ? '(.*)' : '*';
}
