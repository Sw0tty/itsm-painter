export class AppScripts {
    
    static getTeamColorRenderSchema = (color: string) => {
        return `linear-gradient(63deg, rgba(255, 255, 255, 0) 41%, ${color} 100%)`;
    }

    static getRandomHexColor = () => {
        const randomNum = Math.floor(Math.random() * 16777215);
        return '#' + randomNum.toString(16).padStart(6, '0');
    };

}
