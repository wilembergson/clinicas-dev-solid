import { Account } from "../../domain/entities";
import { RepositoryFactory } from "../../domain/factories";
import { AccountRepository } from "../../domain/repositories";
import { Signup } from "../../domain/use-cases/signup";
import { Hasher } from "../protocols/cryptografy/hasher";

export class SignupUsecase implements Signup {
    private readonly accountRepository: AccountRepository
    private readonly hasher: Hasher
    
    constructor(
        repositoryFactory: RepositoryFactory,
        hasher: Hasher
    ) { 
        this.accountRepository = repositoryFactory.accountRepository()
        this.hasher = hasher
    }

    async execute(input: Signup.Input): Promise<Signup.Output> {
        const foundAccount = await this.accountRepository.findByCpf(input.cpf)
        if (!foundAccount) {
            const hashedPassword = await this.hasher.hash(input.password)
            const account = new Account(Object.assign({}, input, { password: hashedPassword }))
            const result = await this.accountRepository.add(account)
            const {id, password, ...accountInformations} = result
            return accountInformations
        }
        return null
    }
}